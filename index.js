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
  // /repos/:owner/:repo/pulls/:number
  handler.on('pull_request', function (event) {

    var pull_request = event.payload.pull_request
    var url = pull_request.url
    var body = pull_request.body
    var user = pull_request.user.login

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
          body: '#PATCH#\n' + body
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
