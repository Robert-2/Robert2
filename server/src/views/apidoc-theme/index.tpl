<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ .Name }} - API documentation</title>
    <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/styles/tomorrow.min.css" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/highlight.min.js"></script>
    <script>
        hljs.configure({ tabReplace: '    ' });
        hljs.initHighlightingOnLoad();
    </script>
    <style>
        {{ template "main.css" }}
        {{ template "sidebar.css" }}
    </style>
</head>
<body data-spy="scroll" data-target=".scrollspy">
    <div id="sidebar-wrapper">
        {{ template "sidebar.tpl" . }}
    </div>
    <div id="page-content-wrapper">
        <div class="container-fluid">
            <div class="row">
                {{ template "content.tpl" . }}
            </div>
        </div>
    </div>
    <script src="https://code.jquery.com/jquery-2.2.2.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>
    <script>{{ template "main.js" . }}</script>
</body>
</html>
