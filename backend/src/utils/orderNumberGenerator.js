export async function nextNumber(client, prefix, table, column) {
  const { rows } = await client.query(
    `SELECT ${column} AS value FROM ${table} WHERE ${column} LIKE $1 ORDER BY id DESC LIMIT 1`,
    [`${prefix}-%`]
  );
  const last = rows[0]?.value?.split("-").pop();
  return `${prefix}-${String((Number(last) || 0) + 1).padStart(5, "0")}`;
}
