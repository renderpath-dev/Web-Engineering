// Goal:
// Type a rest parameter as a tuple

// Expected result
// The compiler accepts this file and rejects invalid argument shapes

export {};

function createAuditLog(...entryParts:[string,"create" | "update" | "delete",number]):string {
    const [entityId,actionName,timestampValue] = entryParts;

    return `${entityId}:${actionName}:${timestampValue}`;
}

console.log(createAuditLog("product-1","update",Date.now()));

// @ts-expect-error:The second tuple item must be a known action.
createAuditLog("product-1","remove",Date.now());

