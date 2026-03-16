import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Sample menu data
SAMPLE_MENU = [
    {
        "id": "1",
        "name": "Butter Chicken",
        "description": "Tender chicken in a creamy tomato-based sauce with aromatic spices",
        "price": 350,
        "image": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500",
        "category": "Main Course",
        "prepTime": 25,
        "popular": True
    },
    {
        "id": "2",
        "name": "Paneer Tikka Masala",
        "description": "Marinated cottage cheese cubes in rich tomato gravy",
        "price": 280,
        "image": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500",
        "category": "Main Course",
        "prepTime": 20,
        "popular": True
    },
    {
        "id": "3",
        "name": "Chicken Biryani",
        "description": "Aromatic basmati rice cooked with tender chicken and exotic spices",
        "price": 320,
        "image": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500",
        "category": "Rice & Biryani",
        "prepTime": 30,
        "popular": True
    },
    {
        "id": "4",
        "name": "Veg Spring Rolls",
        "description": "Crispy rolls filled with fresh vegetables and served with sweet chili sauce",
        "price": 180,
        "image": "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=500",
        "category": "Starters",
        "prepTime": 15,
        "popular": False
    },
    {
        "id": "5",
        "name": "Dal Makhani",
        "description": "Creamy black lentils slow-cooked with butter and cream",
        "price": 220,
        "image": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500",
        "category": "Main Course",
        "prepTime": 20,
        "popular": False
    },
    {
        "id": "6",
        "name": "Tandoori Roti",
        "description": "Whole wheat flatbread baked in traditional tandoor",
        "price": 30,
        "image": "https://images.unsplash.com/photo-1619221882018-1c878d401a7d?w=500",
        "category": "Breads",
        "prepTime": 10,
        "popular": False
    },
    {
        "id": "7",
        "name": "Garlic Naan",
        "description": "Soft leavened bread topped with fresh garlic and butter",
        "price": 50,
        "image": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500",
        "category": "Breads",
        "prepTime": 10,
        "popular": True
    },
    {
        "id": "8",
        "name": "Gulab Jamun",
        "description": "Soft milk dumplings soaked in rose-flavored sugar syrup",
        "price": 80,
        "image": "https://images.unsplash.com/photo-1589119908995-c6c7f9937f04?w=500",
        "category": "Desserts",
        "prepTime": 5,
        "popular": True
    },
    {
        "id": "9",
        "name": "Mango Lassi",
        "description": "Refreshing yogurt-based drink blended with sweet mangoes",
        "price": 90,
        "image": "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=500",
        "category": "Beverages",
        "prepTime": 5,
        "popular": True
    },
]

async def seed_data():
    print("Seeding database with sample data...")
    
    # Clear existing menu items
    await db.menu_items.delete_many({})
    print("Cleared existing menu items")
    
    # Insert sample menu items
    if SAMPLE_MENU:
        await db.menu_items.insert_many(SAMPLE_MENU)
        print(f"Added {len(SAMPLE_MENU)} menu items")
    
    # Create default settings
    settings = {
        "restaurantName": "Quick Order",
        "tagline": "Delicious Food, Quick Service",
        "primaryColor": "#E8C547",
        "logo": None
    }
    await db.settings.delete_many({})
    await db.settings.insert_one(settings)
    print("Created default settings")
    
    print("✓ Database seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_data())
    client.close()
