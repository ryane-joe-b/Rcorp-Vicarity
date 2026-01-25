#!/usr/bin/env python
"""
Database seeding script for Vicarity.

Usage:
    python seed_db.py
"""

import sys
from app.core.database import SessionLocal
from app.models.qualification import seed_qualifications


def main():
    """Seed the database with initial data."""
    print("=" * 60)
    print("Vicarity Database Seeding")
    print("=" * 60)
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Seed qualifications
        print("\n📚 Seeding qualifications...")
        count = seed_qualifications(db)
        print(f"✅ Seeded {count} qualifications")
        
        print("\n" + "=" * 60)
        print("✅ Database seeding complete!")
        print("=" * 60)
        
        return 0
        
    except Exception as e:
        print(f"\n❌ Error seeding database: {e}")
        db.rollback()
        return 1
        
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
