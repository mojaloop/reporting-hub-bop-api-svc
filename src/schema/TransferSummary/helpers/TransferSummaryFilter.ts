export const createWhereCondition = (filter: any) => {
  const createdAt = {
    ...(filter?.startDate && { $gte: new Date(filter.startDate) }),
    ...(filter?.endDate && { $lte: new Date(filter.endDate) }),
  };
  return Object.keys(createdAt).length ? { createdAt } : {};
};
