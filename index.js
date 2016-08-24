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
    console.log('Request Type: ', event.payload.action)
    if (event.payload.action !== 'opened')
      return
    var pull_request = event.payload.pull_request
    var url = pull_request.url
    var body = pull_request.body
    var user = pull_request.user.login

    if (user === 'greenkeeperio-bot') {
      console.log('Message from greenkeeperio-bot detected')
      axios({
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
