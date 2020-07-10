$(
    () => {
      showUserIdLoginContent()
    }
  )
  
  function showUserIdLoginContent() {
    $("#mainDiv").html(userIdLoginContent)
  }
  
  function showAccessKeyLoginContent() {
    $("#mainDiv").html(accessKeyLoginContent)
  }
  
  
  var accessKeyLoginContent =
    `
    <h6 class="navbar-brand ti" href="#"><i>Login Into Impulse VMS</i></h6>
    <form id="accessKeyLoginForm" method="post" action="/accessKeyLogin" class="form-style">
      <div class="form-group">
      <input class="form-control input-style" type="text" name="access_key" placeholder="Impulse VMS Access Key">
      </div>
  
      <div class="form-group">
          <button class="btn btn-primary btn-footer" type="submit">Log In</button>
          <button id = "btn_login_user_id" class="btn btn-primary btn-footer" onclick = "showUserIdLoginContent()" type="button">Log In Via User ID</button>
  <a class="btn btn-success text-center btn-footer" role="button" href="/register">Register Into Impulse</a>
  
              </div>
  </form>`
  var userIdLoginContent =
  
    `
    <h6 class="navbar-brand ti" href="#"><i>Login Into Impulse VMS</i></h6>
              <form id="loginForm" method="post" action="/userLogin" class="form-style">
                  <div class="form-group">
                    <input class="form-control input-style" type="text" name="name" placeholder="User ID">
                  </div>
  
                  <div class="form-group">
                    <input class="form-control input-style" type="password" name="pass" placeholder="Password">
                  </div>
  
                  <div class="form-group">
                    <button class="btn btn-primary btn-footer" type="submit">Log In</button>
                   <!-- <button id="btn_login_access_key" onclick="showAccessKeyLoginContent()" class="btn btn-primary btn-footer" type="button">Log In Via Access Key</button>-->
                    <a class="btn btn-success text-center btn-footer" role="button" href="/register">Register Into Impulse</a>
                  </div>
                </form>`