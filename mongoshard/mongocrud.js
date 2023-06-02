const { MongoClient } = require('mongodb');

const uri = 'mongodb://<username>:<password>@<mongos-hostname>:<mongos-port>/<database-name>';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect((err) => {
    if (err) {
        console.log('Error connecting to the database:', err);
        return;
    }

    const db = client.db('<database-name>');
    const collection = db.collection('<collection-name>');

    // Create (Insert)
    const documentToInsert = { name: 'John', age: 30 };
    collection.insertOne(documentToInsert, (err, result) => {
        if (err) {
            console.log('Error inserting document:', err);
            return;
        }
        console.log('Inserted document:', result.ops);

        // Call the Read function
        readDocuments();

        // Uncomment the following lines to call the Update and Delete functions
        // updateDocument();
        // deleteDocument();
    });

    // Read (Query)
    function readDocuments() {
        collection.find({ name: 'John' }).toArray((err, docs) => {
            if (err) {
                console.log('Error querying collection:', err);
                return;
            }
            console.log('Documents:', docs);

            // Call the Update function
            updateDocument();
        });
    }

    // Update
    function updateDocument() {
        const filter = { name: 'John' };
        const update = { $set: { age: 31 } };
        collection.updateOne(filter, update, (err, result) => {
            if (err) {
                console.log('Error updating document:', err);
                return;
            }
            console.log('Updated document:', result.modifiedCount);

            // Call the Delete function
            deleteDocument();
        });
    }

    // Delete
    function deleteDocument() {
        const deleteFilter = { name: 'John' };
        collection.deleteOne(deleteFilter, (err, result) => {
            if (err) {
                console.log('Error deleting document:', err);
                return;
            }
            console.log('Deleted document:', result.deletedCount);

            // Close the connection
            client.close();
        });
    }
});
