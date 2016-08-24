(function (createHandler, http, axios) {
  var handler = createHandler({ path: '/webhook', secret: process.env.SECRET })
  http.createServer(function (req, res) {
    handler(req, res, function (err) {
      res.statusCode = 404
      res.end('no such location')
    })
  }).listen(process.env.PORT || 3000)

  handler.on('error', function (err) {
    console.error('Error:', err.message)
  })

  handler.on('pull_request_review_comment', function (event) {

    var comment = event.payload.comment
    var url = comment.url
    var body = comment.body
    var user = comment.user.login

    console.log('hit a PR comment from ' + user + 'at ' + url)

    if (user === 'greenkeeperio-bot') {
      console.log('Message from greenkeeperio-bot detected')
      axios.create({
        url: url,
        method: 'patch',
        headers: {
          'Authorization': 'token ' + process.env.TOKEN
        },
        data: {
          body: '#PATCH#' + body
        }
      }).then(function (response) {
        console.log(response)
      }).catch(function (error) {
        console.log(error)
      })
    }
  })
})(
  require('github-webhook-handler'),
  require('http'),
  require('axios')
)
