import 'package:cloud_firestore/cloud_firestore.dart';

class FirestoreClient {
  final FirebaseFirestore _firestore;

  FirestoreClient({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  Future<void> addDocument(
      String collectionName, Map<String, dynamic> data) async {
    await _firestore.collection(collectionName).add({
      "name": data["name"].trim(),
      "winnableGames": data["winnableGames"],
      "date": FieldValue.serverTimestamp(),
    });
  }

  Future<void> updateDocument(String collectionName, String documentId,
      Map<String, dynamic> data) async {
    await _firestore.collection(collectionName).doc(documentId).update(data);
  }

  Future<void> deleteDocument(String collectionName, String documentId) async {
    await _firestore.collection(collectionName).doc(documentId).delete();
  }

  Future<QuerySnapshot> getDocuments(String collectionName) async {
    return await _firestore.collection(collectionName).get();
  }

  Future<DocumentSnapshot> getDocument(
      String collectionName, String documentId) async {
    return await _firestore.collection(collectionName).doc(documentId).get();
  }

  Stream<QuerySnapshot> listenToCollection(String collectionName) {
    return _firestore.collection(collectionName).snapshots();
  }

  Stream<DocumentSnapshot> listenToDocument(
      String collectionName, String documentId) {
    return _firestore.collection(collectionName).doc(documentId).snapshots();
  }
}
