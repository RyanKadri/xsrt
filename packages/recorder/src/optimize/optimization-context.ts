export class OptimizationContext {
    private assets: string[] = [];

    getAssets() {
        return this.assets.concat();
    }

    registerAsset(src: string) {
        let assetInd = this.assets.findIndex(asset => asset === src);

        if (assetInd === -1) {
            assetInd = this.assets.length;
            this.assets.push(src);
        }
        return assetInd;
    }

}
