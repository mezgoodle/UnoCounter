abstract class IRepository<T> {
  Future<void> add(T item);
  Future<void> update(String id, T item);
  Future<void> delete(String id);
  getAll();
}
