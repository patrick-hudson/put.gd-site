export interface ReadOnlyRepository<TEntity> {
  findAll(): readonly TEntity[];
}
