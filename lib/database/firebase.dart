import 'package:cloud_firestore/cloud_firestore.dart';

class FirestoreClient {
  final FirebaseFirestore _firestore;

  FirestoreClient({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  Future<void> addDocument(
      String collectionName, Map<String, dynamic> data) async {
    await _firestore.collection(collectionName).add(data);
  }

  Future<void> updateDocument(String collectionName, String documentId,
      Map<String, dynamic> data) async {
    await _firestore.collection(collectionName).doc(documentId).update(data);
  }

  Future<void> deleteDocument(String collectionName, String documentId) async {
    await _firestore.collection(collectionName).doc(documentId).delete();
  }

  Future<List<Map<String, dynamic>>> getDocuments(String collectionName) async {
    final snapshot = await _firestore.collection(collectionName).get();
    return snapshot.docs.map((doc) => doc.data()).toList();
  }

  CollectionReference<T> collectionRef<T>(String collectionPath,
      {FromFirestore<T>? fromFirestore, ToFirestore<T>? toFirestore}) {
    return _firestore.collection(collectionPath).withConverter<T>(
          fromFirestore: fromFirestore!,
          toFirestore: toFirestore!,
        );
  }
}
