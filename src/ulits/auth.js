import jwt from 'jsonwebtoken'

const screteKey = '74ec5a8b-c3a3-474b-96ea-21720a47ac68'
export default function auth(req, res, next) {
  console.log('token ->', req.path)
    const token = req.cookies.token
    const refreshToken = req.cookies.refreshToken
    
    // if (token == null) return res.sendStatus(401)
    
    jwt.verify(token, screteKey, (err, user) => {
      if (err) {
        if (refreshToken) {
          const refreshData = jwt.decode(refreshToken)
          try {
            jwt.verify(refreshToken, screteKey, (rerr, data) => {
              const token = jwt.sign({ phone_number: data.phone_number, password: data.password }, screteKey, { expiresIn: '10s' })
              const refreshToken = jwt.sign({ phone_number: data.phone_number, password: data.password }, screteKey, { expiresIn: '1h' })
              res.cookie('token', token, { maxAge: 10000, httpOnly: true})
              res.cookie('refreshToken', token)
            })
          } catch(tryerr) {
            // const data = jwt.decode(refreshToken)
              const token = jwt.sign({ phone_number: refreshData.phone_number, password: refreshData.password }, screteKey, { expiresIn: '10s' })
              const refreshToken = jwt.sign({ phone_number: refreshData.phone_number, password: refreshData.password }, screteKey, { expiresIn: '1h' })
              res.cookie('token', token, { maxAge: 10000, httpOnly: true})
              res.cookie('refreshToken', token)
              // return res.status(302).redirect(req.path)

          }
        }
        return res.sendStatus(403)
      }
      console.log('user -> ', user)
      next()
    })
}

export { screteKey }