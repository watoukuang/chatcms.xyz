## DemoChain - DemoChain区块链演示平台

### 生产部署

**前端**

- 构建前端镜像

```shell
docker build -t demochain-ui:latest .
```

- 启动服务

```shell
docker run --name demochain-ui --restart=always -p 3005:3000 demochain-ui:latest
```

**常用命令**

```shell
docker run --name nginx --restart=always -p 443:443 -p 80:80 -d -v /usr/local/nginx/nginx.conf:/etc/nginx/nginx.conf -v /usr/local/web:/usr/local/web -v /usr/local/upload:/usr/local/upload nginx
```

**后端**

- 构建后端二进制包

```shell
root@local:~# cd /opt/app/demochain/demochain-api
root@local:/opt/app/demochain/demochain-api# ./build.sh
```

- 上传数据文件
```shell
root@local:~# cd /opt/data/demochain
root@local:~# scp demochain.db root@38.190.226.11:~
```

- 上传二进制包
```shell
root@local:~# cd /opt/app/demochain/demochain-api/dist
root@local:~# scp demochain root@38.190.226.11:~
```

- 远程登录
```shell
root@local:~# ssh root@38.190.226.11
```

- 新建文件夹
```shell
root@remote:~# mkdir /opt/data/demochain
root@remote:~# mkdir /opt/app/demochain
```
- 移动文件夹
```shell
root@remote:~# mv ~/demochain.db /opt/data/demochain/
root@remote:~# mv ~/demochain /opt/app/demochain/
```

- 启动服务

```shell
root@remote:~#cd /opt/app/demochain/
root@remote:~# ./demochain
```

### 后端接口

默认后端地址：`http://localhost:8085`（可通过环境变量 `PORT` 修改）

- **健康检查**

```bash
curl -X GET http://localhost:8085/health
```

- **用户注册**

```bash
curl -X POST http://localhost:8085/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"your_password"}'
```

- **用户登录（获取 Token）**

```bash
curl -X POST http://localhost:8085/api/auth/Login \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"your_password"}'
```

- **创建订单（需 Bearer Token）**

```bash
curl -X POST http://localhost:8085/api/order/add \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"plan_type":"monthly","network":"usdt_trc20"}'
```

- **分页查询订单（需 Bearer Token）**

```bash
curl -X GET 'http://localhost:8085/api/order/page?page=1&size=10' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

- **文章分页**

```bash
curl -X GET 'http://localhost:8085/api/article/page?page=1&size=10'
```

- **获取文章详情**

```bash
curl -X GET http://localhost:8085/api/article/ARTICLE_ID
```

- **术语分页**

```bash
curl -X GET 'http://localhost:8085/api/term/page?page=1&size=10'
