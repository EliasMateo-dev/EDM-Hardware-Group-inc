// Type definitions for Deno namespace
declare namespace Deno {
  export const env: {
    get(key: string): string | undefined;
  };
  
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}
