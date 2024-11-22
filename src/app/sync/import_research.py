import os
from datetime import datetime
from dotenv import load_dotenv
from pyairtable import Api
from pymongo import MongoClient
from openai import OpenAI
from tqdm import tqdm
import time
import json
from pathlib import Path

# Load environment variables
load_dotenv()

# Initialize OpenAI client
openai_client = OpenAI()

# Initialize Airtable client
api = Api(os.getenv('AIRTABLE_API_KEY'))
base_id = os.getenv('AIRTABLE_BASE_ID')
table_name = os.getenv('AIRTABLE_TABLE_NAME', 'Patient Relevant Resources')

# Initialize MongoDB client
mongo_client = MongoClient(os.getenv('MONGODB_URI'))
mongo_db = mongo_client[os.getenv('MONGODB_DB_NAME')]
mongo_collection = mongo_db[os.getenv('MONGODB_COLLECTION_NAME', 'research_data')]

def validate_env_vars():
    """Validate that all required environment variables are set"""
    required_vars = {
        'AIRTABLE_API_KEY': os.getenv('AIRTABLE_API_KEY'),
        'AIRTABLE_BASE_ID': os.getenv('AIRTABLE_BASE_ID'),
        'OPENAI_API_KEY': os.getenv('OPENAI_API_KEY'),
        'MONGODB_URI': os.getenv('MONGODB_URI'),
        'MONGODB_DB_NAME': os.getenv('MONGODB_DB_NAME')
    }
    
    missing_vars = [var for var, value in required_vars.items() if not value]
    
    if missing_vars:
        raise EnvironmentError(
            f"Missing required environment variables: {', '.join(missing_vars)}\n"
            "Please check your .env file and ensure all required variables are set."
        )

def generate_embedding(text: str) -> list[float]:
    """Generate embedding using OpenAI's API"""
    try:
        response = openai_client.embeddings.create(
            model="text-embedding-3-small",
            input=text,
            encoding_format="float"
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"\nError generating embedding: {e}")
        raise

def import_research():
    """Import research data from Airtable to MongoDB"""
    try:
        validate_env_vars()
        
        print("\n🔄 Starting research import...")
        print("Connecting to Airtable...")
        
        # Get the table using the API
        table = api.table(base_id, table_name)
        
        # Fetch all records and filter for Medical Research
        print("Fetching medical research records...")
        records = table.all(formula="AND({Resource Type} = 'Medical Research')")
        
        if not records:
            print("\n⚠️  No medical research records found!")
            return
        
        print(f"\n📚 Found {len(records)} medical research records to process")
        time.sleep(1)  # Brief pause for readability
        
        # Initialize counters
        created = 0
        updated = 0
        skipped = 0
        
        # Process records with progress bar
        with tqdm(total=len(records), desc="Processing records", 
                 bar_format='{l_bar}{bar}| {n_fmt}/{total_fmt} [{elapsed}<{remaining}]') as pbar:
            
            for record in records:
                fields = record['fields']
                title = fields.get('Title')
                url = fields.get('Link')
                content = fields.get('All text')
                
                if not all([title, url]):
                    pbar.set_postfix_str(f"Skipped: {title[:30]}..." if title else "Missing fields")
                    skipped += 1
                    pbar.update(1)
                    continue
                
                try:
                    # Generate embedding from title and content (if available)
                    text_for_embedding = f"{title} {content}" if content else title
                    embedding = generate_embedding(text_for_embedding)
                    
                    # Prepare document
                    document = {
                        'title': title,
                        'url': url,
                        'content': content,
                        'embedding': embedding,
                        'updatedAt': datetime.utcnow().isoformat()
                    }
                    
                    # Insert document into MongoDB
                    mongo_collection.insert_one(document)
                    created += 1
                    pbar.set_postfix_str(f"Saved: {title[:30]}...")
                    
                except Exception as e:
                    print(f"\n❌ Error processing record: {str(e)}")
                    skipped += 1
                    pbar.set_postfix_str(f"Error: {title[:30]}...")
                
                pbar.update(1)
        
        # Update summary print statements
        print("\n✨ Import completed successfully!")
        print(f"\nSummary:")
        print(f"🆕 Saved: {created}")
        print(f"⚠️  Skipped: {skipped}")
        print(f"📚 Total processed: {len(records)}")
        
    except Exception as e:
        print(f"\n❌ Error during import: {str(e)}")
        if hasattr(e, 'response') and hasattr(e.response, 'text'):
            print(f"Response details: {e.response.text}")

if __name__ == "__main__":
    import_research()