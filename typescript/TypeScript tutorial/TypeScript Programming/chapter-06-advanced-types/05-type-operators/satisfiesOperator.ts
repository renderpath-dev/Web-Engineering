// Goal:
// Check an object against a target type while preserving precise inference.

// Expected result:
// The compiler checks keys and keeps literal property types.

export {};

type RouteName = "home" | "products";

type RouteConfig = {
    path: string;
    requiresAuth: boolean;
};

const routeConfigMap = {
    home: {
        path: "/",
        requiresAuth: false,
    },
    products: {
        path: "/products",
        requiresAuth: true,
    },
} as const satisfies Record<RouteName, RouteConfig>;

const homePath: "/" = routeConfigMap.home.path;
const productsRequiresAuth: true = routeConfigMap.products.requiresAuth;

console.log(homePath);
console.log(productsRequiresAuth);

const brokenRouteConfigMap = {
    home: {
        path: "/",
        requiresAuth: false,
    },
    products: {
        path: "/products",
        requiresAuth: true,
    },
    // @ts-expect-error: admin is not part of RouteName.
    admin: {
        path: "/admin",
        requiresAuth: true,
    },
} satisfies Record<RouteName, RouteConfig>;

console.log(typeof brokenRouteConfigMap);