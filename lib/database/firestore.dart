import 'package:cloud_firestore/cloud_firestore.dart';

class FirestoreClient {
  final FirebaseFirestore _firestore;

  FirestoreClient({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  addDocument(String collectionName, Map<String, dynamic> data) async {
    await _firestore.collection(collectionName).add(data);
  }

  updateDocument(String collectionName, String documentId,
      Map<String, dynamic> data) async {
    await _firestore.collection(collectionName).doc(documentId).update(data);
  }

  deleteDocument(String collectionName, String documentId) async {
    await _firestore.collection(collectionName).doc(documentId).delete();
  }

  Future<List<Map<String, dynamic>>> getDocuments(String collectionName) async {
    final snapshot = await _firestore.collection(collectionName).get();
    return snapshot.docs.map((doc) => doc.data()).toList();
  }

  getDocumentsStream(String collectionName) {
    return _firestore.collection(collectionName).snapshots().map((snapshot) {
      return snapshot.docs.map((doc) {
        final data = doc.data();
        data['id'] = doc.id;
        return data;
      }).toList();
    });
  }
}
