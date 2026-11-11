const express = require('express')
const fs = require('fs')
const path = require('path')
const app = express()
const PORT = 3000
const DB_FILE = path.join(__dirname, 'data.json')

// 解析json请求体
app.use(express.json())

// 初始化json文件，不存在就新建空数组
function initDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([]))
  }
}
initDB()

// 读取数据
function readData() {
  const raw = fs.readFileSync(DB_FILE, 'utf8')
  return JSON.parse(raw)
}
// 写入数据
function writeData(list) {
  fs.writeFileSync(DB_FILE, JSON.stringify(list, null, 2))
}

// ---------------- 三个接口 ----------------
// 1. GET 获取列表
app.get('/api/item', (req, res) => {
  const list = readData()
  res.json({
    code: 200,
    data: list,
    msg: "获取列表成功"
  })
})

// 2. POST 新增
app.post('/api/item', (req, res) => {
  const { name, content } = req.body
  // 参数校验：缺字段返回400
  if (!name || !content) {
    return res.status(400).json({
      code: 400,
      data: null,
      msg: "缺少必填字段：name、content"
    })
  }
  const list = readData()
  const newItem = {
    id: Date.now(),
    name,
    content
  }
  list.push(newItem)
  writeData(list)
  res.json({
    code: 200,
    data: newItem,
    msg: "新增成功"
  })
})

// 3. DELETE 删除
app.delete('/api/item/:id', (req, res) => {
  const id = Number(req.params.id)
  const list = readData()
  const index = list.findIndex(item => item.id === id)
  if (index === -1) {
    return res.status(400).json({
      code: 400,
      data: null,
      msg: "找不到该数据，删除失败"
    })
  }
  list.splice(index, 1)
  writeData(list)
  res.json({
    code: 200,
    data: null,
    msg: "删除成功"
  })
})

// 全局错误处理中间件（四参数，必须放最后）
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({
    code: 500,
    data: null,
    msg: "服务器内部异常"
  })
})

app.listen(PORT, () => {
  console.log(`服务启动：http://127.0.0.1:${PORT}`)
})
