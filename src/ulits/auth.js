import jwt from 'jsonwebtoken'

const screteKey = '74ec5a8b-c3a3-474b-96ea-21720a47ac68'
function auth(req, res, next) {
  // console.log('headers ->', req.headers)
  const authorization = req.headers['authorization']
  if (!authorization) return res.sendStatus(403)
  
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
        const newToken = setToken({ phone_number: user.phone_number }, '5s')
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
}

function setToken(data, time = '5s', key = screteKey) {
  return jwt.sign(data, key, { expiresIn: time })
}

export { setToken, auth }