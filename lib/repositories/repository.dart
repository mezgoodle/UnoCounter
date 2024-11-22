abstract class IRepository<T> {
  add(T item);
  Future<void> update(String id, T item);
  delete(String id);
  getAll();
}
