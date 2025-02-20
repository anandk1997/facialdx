import moduleAlias from "module-alias";
import path from "path";

moduleAlias.addAliases({
  src: path.resolve(__dirname, "./"),
});
