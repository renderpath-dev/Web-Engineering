// Goal:
// Build a request configuration with a fluent builder

// Expected result:
// The compiler preserves the chain and Node prints the URL

export {};

type RequestConfig = {
    readonly url: string;
    readonly method: "GET" | "POST";
    readonly headers: Record<string, string>;
};

class RequestBuilder {
    private urlValue = "/";
    private methodValue: "GET" | "POST" = "GET";
    private headerMap: Record<string, string> ={};

    url(urlValue: string): this {
        this.urlValue = urlValue;
        return this;
    }

    method(methodValue:"GET" | "POST"):this {
        this.methodValue = methodValue;
        return this;
    }

    header(nameText: string, valueText: string):this {
        this.headerMap[nameText] = valueText;
        return this;
    }

    build(): RequestConfig {
        return {
            url: this.urlValue,
            method: this.methodValue,
            headers: {...this.headerMap},
        }
    }
}

const requestConfig = new RequestBuilder()
.url("/api/products")
.method("GET")
.header("Accept","application/json")
.build();

console.log(requestConfig.url);