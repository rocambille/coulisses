export default (<Contract>{
  get: {
    method: "get",
    path: "/api/health",
    cases: {
      success: {
        request: {},
        response: { status: 200, body: { hello: "world" } },
      },
    },
  },
  post: {
    method: "post",
    path: "/api/health",
    cases: {
      success: {
        request: { body: { foo: "bar" } },
        response: { status: 200, body: { foo: "bar" } },
      },
      unauthorized: {
        request: { body: { foo: "bar" }, withoutCsrfProtection: true },
        response: { status: 401, body: {} },
      },
    },
  },
});
