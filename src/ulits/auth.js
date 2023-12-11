import jwt from 'jsonwebtoken'

const screteKey = '74ec5a8b-c3a3-474b-96ea-21720a47ac68'
function auth(req, res, next) {
  // console.log('headers ->', req.headers)
  const authorization = req.headers['authorization'] || (req.query.token ? `Bearer ${req.query.token}` : null)
  if (!authorization || !authorization.includes('Bearer ')) return res.sendStatus(403)
  const authAry = authorization.split(' ')
  let token,refreshToken
  if (authAry.includes('RefreshToken')) {
    refreshToken = authAry.pop()
  } else {
    token = authAry.pop()
  }

  if (refreshToken) {
    jwt.verify(refreshToken, screteKey, (err, user) => {
      if (!err) {
        const newToken = setToken({ phone_number: user.phone_number }, '600s')
        res.header('Access-Control-Expose-Headers', '*')
        res.header('x-new-token', newToken)
        return next()
      }
      
      res.sendStatus(403)
    })
  }

  if (token) {
    jwt.verify(token, screteKey, (err, user) => {
      // const refreshData = jwt.decode(refreshToken)
      if (!err) return next()
      res.sendStatus(401)
    })
  }

  if (!token && !refreshToken) res.sendStatus(403)
}

function setToken(data, time = '5s', key = screteKey) {
  return jwt.sign(data, key, { expiresIn: time })
}

function verify(token, key = screteKey) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, key, (err, user) => {
      if (!err) {
        resolve(user)
      } else {
        reject(err)
      }
    })
  })
}

function sourceAuth(req, res, next) {
  const token = req.query.token
  verify(token)
  .then(() => next())
  .catch(() => res.sendStatus(401))
}

function fontendAuth(req, res, next) {
  if (req.path === '/') {
    res.header('Access-Control-Expose-Headers', '*')
    const domain = process.env.DOMAIN
    const ws = process.env.WS
    // console.log('path -> ', req.path)
    if (domain && ws) {
      res.header('x-new-domain', domain)
      res.header('x-new-ws', ws)
    }
  }
  next()
}

export { setToken, auth, verify, sourceAuth , fontendAuth}