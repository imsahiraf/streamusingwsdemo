const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;
const uri = 'mongodb://<username>:<password>@<mongos-hostname>:<mongos-port>/<database-name>';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.json());

// Create (Insert) - POST request
app.post('/documents', (req, res) => {
    const documentToInsert = req.body;
    client.connect((err) => {
        if (err) {
            console.log('Error connecting to the database:', err);
            res.status(500).send('Error connecting to the database');
            return;
        }
        const db = client.db('<database-name>');
        const collection = db.collection('<collection-name>');
        collection.insertOne(documentToInsert, (err, result) => {
            if (err) {
                console.log('Error inserting document:', err);
                res.status(500).send('Error inserting document');
                return;
            }
            console.log('Inserted document:', result.ops);
            res.status(201).send('Document inserted successfully');
            client.close();
        });
    });
});

// Read (Query) - GET request
app.get('/documents', (req, res) => {
    client.connect((err) => {
        if (err) {
            console.log('Error connecting to the database:', err);
            res.status(500).send('Error connecting to the database');
            return;
        }
        const db = client.db('<database-name>');
        const collection = db.collection('<collection-name>');
        collection.find({}).toArray((err, docs) => {
            if (err) {
                console.log('Error querying collection:', err);
                res.status(500).send('Error querying collection');
                return;
            }
            console.log('Documents:', docs);
            res.send(docs);
            client.close();
        });
    });
});

// Update - PUT request
app.put('/documents/:id', (req, res) => {
    const documentId = req.params.id;
    const update = req.body;
    client.connect((err) => {
        if (err) {
            console.log('Error connecting to the database:', err);
            res.status(500).send('Error connecting to the database');
            return;
        }
        const db = client.db('<database-name>');
        const collection = db.collection('<collection-name>');
        collection.updateOne({ _id: documentId }, { $set: update }, (err, result) => {
            if (err) {
                console.log('Error updating document:', err);
                res.status(500).send('Error updating document');
                return;
            }
            console.log('Updated document:', result.modifiedCount);
            res.send('Document updated successfully');
            client.close();
        });
    });
});

// Delete - DELETE request
app.delete('/documents/:id', (req, res) => {
    const documentId = req.params.id;
    client.connect((err) => {
        if (err) {
            console.log('Error connecting to the database:', err);
            res.status(500).send('Error connecting to the database');
            return;
        }
        const db = client.db('<database-name>');
        const collection = db.collection('<collection-name>');
        collection.deleteOne({ _id: documentId }, (err, result) => {
            if (err) {
                console.log('Error deleting document:', err);
                res.status(500).send('Error deleting document');
                return;
            }
            console.log('Deleted document:', result.deletedCount);
            res.send('Document deleted successfully');
            client.close();
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
