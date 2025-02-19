import os
from datetime import datetime
from dotenv import load_dotenv
from pyairtable import Api
from pymongo import MongoClient
import openai
from tqdm import tqdm
import time

# Load environment variables
load_dotenv()

# Airtable Configuration
api = Api(os.getenv("AIRTABLE_API_KEY"))
base_id = os.getenv("AIRTABLE_BASE_ID")

# Table Names and Corresponding MongoDB Collections
tables = {
    "Patient Relevant Resources": "patient_relevant_resources",
    "State Medical Resources": "state_medical_resources",
    "Hospital Facilities": "hospital_facilities",
}

# OpenAI Configuration
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise EnvironmentError("OPENAI_API_KEY is missing or not set in .env file.")
openai.api_key = openai_api_key

# MongoDB Configuration
mongo_uri = os.getenv("MONGO_URI") or os.getenv("DATABASE_URL")
if not mongo_uri:
    raise EnvironmentError("MONGO_URI or DATABASE_URL is missing from the .env file.")

mongo_client = MongoClient(mongo_uri)
mongo_db = mongo_client["test"]

def validate_env_vars():
    """Ensure all required environment variables are set."""
    required_vars = {
        "AIRTABLE_API_KEY": os.getenv("AIRTABLE_API_KEY"),
        "AIRTABLE_BASE_ID": os.getenv("AIRTABLE_BASE_ID"),
        "OPENAI_API_KEY": os.getenv("OPENAI_API_KEY"),
        "MONGO_URI or DATABASE_URL": mongo_uri,
    }
    missing_vars = [var for var, value in required_vars.items() if not value]
    if missing_vars:
        raise EnvironmentError(
            f"Missing required environment variables: {', '.join(missing_vars)}\n"
            "Please check your .env file and ensure all required variables are set."
        )

def delete_existing_data():
    """Delete all data from specified MongoDB collections."""
    print("\n🗑️ Deleting existing data from MongoDB collections...")
    try:
        for _, collection_name in tables.items():
            mongo_db[collection_name].delete_many({})  # Delete all documents
            print(f"✅ Cleared collection: {collection_name}")
    except Exception as e:
        print(f"❌ Error deleting data: {e}")
        raise

def fetch_and_store_records():
    """Fetch records from multiple Airtable tables and store them in MongoDB."""
    try:
        # Validate environment variables
        validate_env_vars()

        # Clear existing data from MongoDB
        delete_existing_data()

        # Process each table in Airtable
        for table_name, mongo_collection_name in tables.items():
            print(f"\n🔄 Fetching records from table: {table_name}...")

            # Get the table object
            table = api.get_table(base_id, table_name)
            records = table.all()  # Fetch all records

            if not records:
                print(f"\n⚠️ No records found in table: {table_name}")
                continue

            print(f"\n📚 Found {len(records)} records in table: {table_name}")
            time.sleep(1)

            created, skipped = 0, 0
            mongo_collection = mongo_db[mongo_collection_name]

            # Process each record with progress bar
            with tqdm(total=len(records), desc=f"Processing {table_name}") as pbar:
                for record in records:
                    fields = record.get("fields", {})
                    document = {
                        "_id": record.get("id"),  # Use Airtable record ID as MongoDB ID
                        "createdAt": fields.get("createdAt", datetime.utcnow().isoformat()),
                        "updatedAt": datetime.utcnow().isoformat(),
                    }

                    # Extract fields dynamically based on the table
                    if table_name == "Patient Relevant Resources":
                        document.update({
                            "title": fields.get("Title"),
                            "link": fields.get("Link"),
                            "resource_type": fields.get("Resource Type"),
                            "content": fields.get("All text", ""),
                        })

                        text_for_embedding = f"{document['title']} {document['content']} {document['resource_type'] or ''}"
                        if not document["title"]:
                            skipped += 1
                            pbar.update(1)
                            continue

                        try:
                            document["embedding"] = openai.Embedding.create(
                                model="text-embedding-ada-002",
                                input=text_for_embedding
                            )["data"][0]["embedding"]
                        except Exception as e:
                            print(f"\n❌ Error generating embedding: {e}")
                            skipped += 1
                            pbar.update(1)
                            continue
                    
                    elif table_name == "State Medical Resources":
                        document.update({
                            "name": fields.get("Name"),
                            "state": fields.get("State"),
                            "facility_type": fields.get("Facility Type"),
                        })
                        if not document["name"]:
                            skipped += 1
                            pbar.update(1)
                            continue
                    
                    elif table_name == "Hospital Facilities":
                        document.update({
                            "name": fields.get("Name"),
                            "link": fields.get("Link"),
                            "type": fields.get("Type"),
                            "associated_to": fields.get("Associated To"),
                        })
                        if not document["name"]:
                            skipped += 1
                            pbar.update(1)
                            continue

                    try:
                        # Insert into MongoDB
                        mongo_collection.update_one(
                            {"_id": document["_id"]},  # Match by ID
                            {"$set": document},        # Update fields
                            upsert=True                # Insert if not found
                        )
                        created += 1
                    except Exception as e:
                        print(f"\n❌ Error processing record: {e}")
                        skipped += 1

                    pbar.update(1)

            # Summary for the table
            print(f"\n✨ Completed processing for table: {table_name}")
            print(f"✅ Created: {created}")
            print(f"⚠️ Skipped: {skipped}")

    except Exception as e:
        print(f"\n❌ Error during processing: {e}")

if __name__ == "__main__":
    fetch_and_store_records()
