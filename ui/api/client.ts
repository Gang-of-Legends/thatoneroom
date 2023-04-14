import { useState, useEffect } from "react";
import { createPromiseClient, PromiseClient } from "@bufbuild/connect";
import { createConnectTransport } from "@bufbuild/connect-web";

import { ServerService } from "./thatoneroom/server/v1/service_connect";

export function useClientV1() {
  const [client, setClient] = useState<PromiseClient<
    typeof ServerService
  > | null>(null);

  useEffect(() => {
    const transport = createConnectTransport({
      baseUrl: "http://51.89.7.121:80",
    });

    async function init() {
      const client = createPromiseClient(ServerService, transport);
      setClient(client);
    }

    init();
  }, []);

  return client;
}
