// Goal:
// Use mapped and conditional types to derive a client-safe view model.

// Expected result:
// The compiler derives a public model and protects branded ids.

export {};

type Brand<BaseType, BrandName extends string> = BaseType & {
    readonly __brand: BrandName;
};

type UserId = Brand<string, "UserId">;

type InternalUserRecord = {
    id: UserId;
    email: string;
    passwordHash: string;
    createdAt: Date;
};

type RemovePrivateFields<SourceType> = {
    [KeyName in keyof SourceType as KeyName extends `password${string}` ? never : KeyName]: SourceType[KeyName];
};

type SerializeDates<SourceType> = {
    [KeyName in keyof SourceType]: SourceType[KeyName] extends Date
        ? string
        : SourceType[KeyName];
};

type PublicUserView = SerializeDates<RemovePrivateFields<InternalUserRecord>>;

function createUserId(value: string): UserId {
    return value as UserId;
}

function toPublicUserView(user: InternalUserRecord): PublicUserView {
    return {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
    };
}

const userRecord: InternalUserRecord = {
    id: createUserId("u1"),
    email: "ada@example.com",
    passwordHash: "hash",
    createdAt: new Date("2026-05-15T00:00:00Z"),
};

const publicView = toPublicUserView(userRecord);

console.log(publicView.createdAt);

// @ts-expect-error: passwordHash was removed from the public view.
console.log(publicView.passwordHash);