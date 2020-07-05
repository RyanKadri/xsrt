import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({
  name: "asset"
})
export class AssetEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "orig_url" })
  origUrl: string;

  @Column({ name: "proxy_path"})
  proxyPath: string;

  @Column({ name: "hash" })
  hash: string;

  @Column({ name: "headers", type: "json" })
  headers: ProxyHeader[];

}

export interface ProxyHeader {
    name: string;
    value: string;
}
