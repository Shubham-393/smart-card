import firebase_admin
from firebase_admin import credentials, firestore
import json

# Initialize Firestore
cred = credentials.Certificate("serviceAccountKey.json")  # Your Firebase service account key
firebase_admin.initialize_app(cred)
db = firestore.client()

# Load JSON file
with open("student_transaction.json", "r") as file:
    data = json.load(file)

# Upload data (Assuming data is a dictionary of collections)
for collection_name, documents in data.items():
    collection_ref = db.collection(collection_name)
    for doc_id, doc_data in documents.items():
        collection_ref.document(doc_id).set(doc_data)  # Upload each document

print("Data uploaded successfully!")