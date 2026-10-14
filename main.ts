import * as request from "request";
import { FilesBuilder } from "./src/files-builder";
import { ContentGenerate } from "./src/content-generate";
import { NativeSet } from "./src/enum/NativeSet";
import { terminal as term } from "terminal-kit";

/**
 * The [[Main]] class that groups together all the logical execution processes of the system.
 */
export class Main {
  /**
   * @param nativeSet
   */
  private static getNativeLink = (nativeSet: NativeSet): string => {
    switch (nativeSet) {
      default:
      case NativeSet.GTA:
        return "https://static.cfx.re/natives/natives.json";
      case NativeSet.RDR3:
        return "https://raw.githubusercontent.com/VORPCORE/RDR3natives/main/rdr3natives.json";
      case NativeSet.Cfx:
        return "https://static.cfx.re/natives/natives_cfx.json";
    }
  };

  /**
   * @param nativeSet
   */
  private static getNativeDocsUrl = (nativeSet: NativeSet): string => {
    switch (nativeSet) {
      case NativeSet.RDR3:
        return "https://rdr3natives.com/?_";
      default:
        return "https://docs.fivem.net/natives/?_";
    }
  };

  /**
   * Startup logic
   *
   * @param dir Location of the file where the project will be built
   *
   * @param nativeSet
   * @return void
   */
  public static onEnable = (
    dir: string,
    nativeSet: NativeSet
  ): Promise<void> => {
    let json = Main.getNativeLink(nativeSet);

    if (!json) return;

    return new Promise((resolve) => {
      request.get(json, async (error, response, content) => {
        const files = new FilesBuilder(dir);
        const json = JSON.parse(content);

        await files.init();

        files.category(json);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const builder = new ContentGenerate(files, nativeSet).setDocumentationUrl(
          Main.getNativeDocsUrl(nativeSet)
        );

        try {
          await builder.generateTemplate(json);
        } catch (err) {
          term.red(`${err}\n`);
        } finally {
          resolve();
        }
      });
    });
  };

  /**
   * Folder generate logic
   *
   * @param response
   *
   * @return void
   */
  public static onFolderGenerate = (response: void) => {
    term.cyan("Create output directory successfully : " + response + "\n");
  };

  /**
   * File update logic
   *
   * @param stats
   * @param filename Name of the updated file
   * @param nativename Name of the native
   *
   * @return void
   */
  public static onFileUpdate = (
    stats: { native: { total: number; current: number } },
    filename: String,
    nativename: String
  ): void => {
    stats.native.current++;
    term.green("[File : " + filename + " ] [Native : " + nativename + " ]\n");
    if (stats.native.current == stats.native.total) process.exit();
  };
}

term.cyan(
  "Generating Lua type annotations for FiveM and RedM natives.\n"
);

const nativeSets: Record<string, [string, NativeSet]> = {
  cfx: ["natives/CFX-NATIVE", NativeSet.Cfx],
  gta: ["natives/GTAV", NativeSet.GTA],
  rdr3: ["natives/RDR3", NativeSet.RDR3],
};

const selected = process.argv.slice(2).map((arg) => arg.toLowerCase());
const unknown = selected.filter((arg) => !(arg in nativeSets));

if (unknown.length) {
  term.red(
    `Unknown native set: ${unknown.join(", ")}. Available: ${Object.keys(nativeSets).join(", ")}\n`
  );
  process.exit(1);
}

(async () => {
  for (const nativeSet of new Set(["cfx", ...(selected.length ? selected : ["gta", "rdr3"])])) {
    await Main.onEnable(...nativeSets[nativeSet]);
  }

  process.exit();
})();
