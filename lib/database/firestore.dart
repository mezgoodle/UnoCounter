import 'package:cloud_firestore/cloud_firestore.dart';
import 'dart:async';

/// A client wrapper for Firebase Firestore operations.
///
/// Provides CRUD operations and stream functionality for Firestore collections.
/// Supports dependency injection for better testability.
class FirestoreClient {
  final FirebaseFirestore _firestore;

  FirestoreClient({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  Future<T> _withRetry<T>(
    Future<T> Function() operation, {
    int maxAttempts = 3,
    Duration delayBetweenAttempts = const Duration(seconds: 2),
  }) async {
    int attempts = 0;
    while (true) {
      try {
        return await operation();
      } catch (e) {
        attempts++;
        if (attempts >= maxAttempts) {
          rethrow;
        }
        await Future.delayed(delayBetweenAttempts);
      }
    }
  }

  addDocument(String collectionName, Map<String, dynamic> data) async {
    if (collectionName.isEmpty) {
      throw ArgumentError('Collection name is empty');
    }
    try {
      await _withRetry(() => _firestore.collection(collectionName).add(data));
    } on FirebaseException catch (e) {
      throw FirebaseException(
          plugin: 'cloud_firestore', code: e.code, message: e.message);
    } catch (e) {
      throw Exception('Failed to add document: $e');
    }
  }

  updateDocument(String collectionName, String documentId,
      Map<String, dynamic> data) async {
    if (collectionName.isEmpty) {
      throw ArgumentError('Collection name is empty');
    }
    try {
      await _withRetry(() =>
          _firestore.collection(collectionName).doc(documentId).update(data));
    } on FirebaseException catch (e) {
      throw FirebaseException(
          plugin: 'cloud_firestore', code: e.code, message: e.message);
    } catch (e) {
      throw Exception('Failed to update document: $e');
    }
  }

  deleteDocument(String collectionName, String documentId) async {
    if (collectionName.isEmpty) {
      throw ArgumentError('Collection name is empty');
    }
    try {
      await _withRetry(
          () => _firestore.collection(collectionName).doc(documentId).delete());
    } on FirebaseException catch (e) {
      throw FirebaseException(
          plugin: 'cloud_firestore', code: e.code, message: e.message);
    } catch (e) {
      throw Exception('Failed to delete document: $e');
    }
  }

  getDocumentsStream(String collectionName) {
    return _firestore.collection(collectionName).snapshots().map((snapshot) {
      return snapshot.docs.map((doc) {
        final data = doc.data();
        data['id'] = doc.id;
        return data;
      }).toList();
    }).handleError((error) {
      throw FirebaseException(
        plugin: 'cloud_firestore',
        code: error.code,
        message: error.message,
      );
    });
  }
}
