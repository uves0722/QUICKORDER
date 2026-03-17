from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import bcrypt
import jwt
from passlib.context import CryptContext


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class Admin(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: EmailStr
    password: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdminRegister(BaseModel):
    username: str
    email: EmailStr
    password: str

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminResponse(BaseModel):
    id: str
    username: str
    email: str

class MenuItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    image: Optional[str] = None
    category: Optional[str] = None
    prepTime: Optional[int] = None
    popular: bool = False

class MenuItemCreate(BaseModel):
    name: str
    description: str
    price: str
    image: Optional[str] = None
    category: Optional[str] = None
    prepTime: Optional[str] = None
    popular: bool = False

class OrderItem(BaseModel):
    id: str
    name: str
    price: float
    quantity: int
    image: Optional[str] = None

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    items: List[OrderItem]
    tableNumber: str
    total: float
    status: str = "pending"
    timestamp: str

class OrderCreate(BaseModel):
    items: List[OrderItem]
    tableNumber: str
    total: float
    timestamp: str

class Settings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    restaurantName: str = "Quick Order"
    tagline: str = "Delicious Food, Quick Service"
    primaryColor: str = "#E8C547"
    logo: Optional[str] = None

class SettingsUpdate(BaseModel):
    restaurantName: Optional[str] = None
    tagline: Optional[str] = None
    primaryColor: Optional[str] = None
    logo: Optional[str] = None


# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_token(admin_id: str) -> str:
    return jwt.encode({"admin_id": admin_id}, SECRET_KEY, algorithm=ALGORITHM)


# Admin Routes
@api_router.post("/admin/register")
async def register_admin(admin_data: AdminRegister):
    # Check if max 3 admins already exist
    admin_count = await db.admins.count_documents({})
    if admin_count >= 3:
        raise HTTPException(status_code=400, detail="Maximum 3 admin accounts allowed")
    
    # Check if username already exists
    existing = await db.admins.find_one({"username": admin_data.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Create new admin
    hashed_password = admin_data.password
    admin = Admin(
        username=admin_data.username,
        email=admin_data.email,
        password=hashed_password
    )
    
    doc = admin.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.admins.insert_one(doc)
    
    token = create_token(admin.id)
    
    return {
        "token": token,
        "admin": AdminResponse(
            id=admin.id,
            username=admin.username,
            email=admin.email
        )
    }

@api_router.post("/admin/login")
async def login_admin(login_data: AdminLogin):
    # Find admin
    admin_doc = await db.admins.find_one({"username": login_data.username})
    if not admin_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not verify_password(login_data.password, admin_doc['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(admin_doc['id'])
    
    return {
        "token": token,
        "admin": AdminResponse(
            id=admin_doc['id'],
            username=admin_doc['username'],
            email=admin_doc['email']
        )
    }


# Menu Routes
@api_router.get("/menu", response_model=List[MenuItem])
async def get_menu():
    items = await db.menu_items.find({}, {"_id": 0}).to_list(1000)
    return items

@api_router.post("/menu", response_model=MenuItem)
async def create_menu_item(item_data: MenuItemCreate):
    item = MenuItem(
        name=item_data.name,
        description=item_data.description,
        price=float(item_data.price),
        image=item_data.image,
        category=item_data.category,
        prepTime=int(item_data.prepTime) if item_data.prepTime else None,
        popular=item_data.popular
    )
    
    doc = item.model_dump()
    await db.menu_items.insert_one(doc)
    
    return item

@api_router.put("/menu/{item_id}", response_model=MenuItem)
async def update_menu_item(item_id: str, item_data: MenuItemCreate):
    item = MenuItem(
        id=item_id,
        name=item_data.name,
        description=item_data.description,
        price=float(item_data.price),
        image=item_data.image,
        category=item_data.category,
        prepTime=int(item_data.prepTime) if item_data.prepTime else None,
        popular=item_data.popular
    )
    
    doc = item.model_dump()
    await db.menu_items.update_one({"id": item_id}, {"$set": doc}, upsert=True)
    
    return item

@api_router.delete("/menu/{item_id}")
async def delete_menu_item(item_id: str):
    result = await db.menu_items.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return {"message": "Menu item deleted"}


# Order Routes
@api_router.get("/orders", response_model=List[Order])
async def get_orders():
    orders = await db.orders.find({}, {"_id": 0}).sort("timestamp", -1).to_list(1000)
    return orders

@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate):
    order = Order(**order_data.model_dump())
    
    doc = order.model_dump()
    await db.orders.insert_one(doc)
    
    return order

@api_router.put("/orders/{order_id}")
async def update_order_status(order_id: str, status_data: dict):
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": status_data.get("status", "pending")}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order status updated"}


# Settings Routes
@api_router.get("/settings", response_model=Settings)
async def get_settings():
    settings = await db.settings.find_one({}, {"_id": 0})
    if not settings:
        # Return default settings
        return Settings()
    return Settings(**settings)

@api_router.put("/settings", response_model=Settings)
async def update_settings(settings_data: SettingsUpdate):
    # Get existing settings or create new
    existing = await db.settings.find_one({})
    
    if existing:
        # Update existing
        update_data = {k: v for k, v in settings_data.model_dump().items() if v is not None}
        await db.settings.update_one({}, {"$set": update_data})
        updated = await db.settings.find_one({}, {"_id": 0})
        return Settings(**updated)
    else:
        # Create new
        settings = Settings(**settings_data.model_dump(exclude_none=True))
        await db.settings.insert_one(settings.model_dump())
        return settings


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
