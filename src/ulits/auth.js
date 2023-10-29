import jwt from 'jsonwebtoken'

const screteKey = '74ec5a8b-c3a3-474b-96ea-21720a47ac68'
export default function auth(req, res, next) {
  // console.log('token ->', req.cookies)
    const token = req.cookies.token
    
    if (token == null) return res.sendStatus(401)
    
    jwt.verify(token, screteKey, (err, user) => {
      if (err) return res.sendStatus(403)
      next()
    })
}

export { screteKey }