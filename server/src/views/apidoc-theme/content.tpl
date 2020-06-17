<div class="col-lg-12">
    <h1>{{ .Name }}</h1>

    <h2 id="doc-general-notes">
        General notes
        <a href="#doc-general-notes"><i class="glyphicon glyphicon-link"></i></a>
    </h2>

    <p>
        This documentation is automatically generated with
        <a href="https://github.com/aubm/postmanerator">Postmanerator</a>
        using a Postman collection that is located in the source
        code of the application, into <code>utilities/postman/</code> folder.
    </p>

    {{ markdown .Description }}

    {{ with $structures := .Structures }}
    <h2 id="doc-api-structures">
        API structures
        <a href="#doc-api-structures"><i class="glyphicon glyphicon-link"></i></a>
    </h2>
    {{ range $structures }}
    <h3 id="struct-{{ .Name }}">
        {{ .Name }}
        <a href="#struct-{{ .Name }}"><i class="glyphicon glyphicon-link"></i></a>
    </h3>
    <p>{{ .Description }}</p>
    <table class="table table-bordered">
    {{ range .Fields }}
        <tr>
            <th>{{ .Name }}</th>
            <td>{{ .Type }}</td>
            <td>{{ .Description }}</td>
        </tr>
    {{ end }}
    </table>
    {{ end }}
    {{ end }}

    <h2 id="doc-api-detail">
        API detail
        <a href="#doc-api-detail"><i class="glyphicon glyphicon-link"></i></a>
    </h2>
    {{ range .Requests }}
    {{ $req := . }}
    <div class="request">
        <h3 id="request-{{ slugify $req.Name }}">
            {{ $req.Name }}
            <a href="#request-{{ slugify $req.Name }}">
                <i class="glyphicon glyphicon-link"></i>
            </a>
        </h3>
        <div>{{ markdown $req.Description }}</div>
        <div>
            <ul class="nav nav-tabs" role="tablist">
                <li role="presentation" class="active">
                    <a href="#request-{{ slugify $req.Name }}-example-http" data-toggle="tab">HTTP</a>
                </li>
                <li role="presentation">
                    <a href="#request-{{ slugify $req.Name }}-example-curl" data-toggle="tab">Curl</a>
                </li>
            </ul>
            <div class="tab-content">
                <div class="tab-pane active" id="request-{{ slugify $req.Name }}-example-http">
                    <pre><code class="hljs http">{{ httpSnippet $req }}</code></pre>
                </div>
                <div class="tab-pane" id="request-{{ slugify $req.Name }}-example-curl">
                    <pre><code class="hljs curl">{{ curlSnippet $req }}</code></pre>
                </div>
            </div>
        </div>
        <h5 class="request-url">Example: {{ $req.Method }} {{ $req.URL }}</h5>
        {{ with $req.Responses }}
        <div>
            <ul class="nav nav-tabs" role="tablist">
                {{ range $index, $res := . }}
                <li role="presentation"{{ if eq $index 0 }} class="active"{{ end }}>
                    <a href="#request-{{ slugify $req.Name }}-responses-{{ $res.ID }}" data-toggle="tab">
                    {{ if eq (len $req.Responses) 1 }}
                        Response
                    {{ else}}
                        {{ $res.Name }}
                    {{ end }}
                    </a>
                </li>
                {{ end }}
            </ul>
            <div class="tab-content">
                {{ range $index, $res := . }}
                <div
                    class="tab-pane{{ if eq $index 0 }} active{{ end }}"
                    id="request-{{ slugify $req.Name }}-responses-{{ $res.ID }}"
                >
                    <table class="table">
                        <tr>
                            <th style="width: 20%;">Status</th>
                            <td>{{ $res.StatusCode }} {{ $res.Status }}</td>
                        </tr>
                        {{ range $res.Headers }}
                        <tr>
                            <th style="width: 20%;">{{ .Key }}</th>
                            <td>{{ .Value }}</td>
                        </tr>
                        {{ end }}
                        {{ if hasContent $res.Body }}
                            {{ with $example := indentJSON $res.Body }}
                            <tr>
                                <td class="response-text-sample" colspan="2">
                                    <pre><code>{{ $example }}</code></pre>
                                </td>
                            </tr>
                            {{ end }}
                        {{ end }}
                    </table>
                </div>
                {{ end }}
            </div>
        </div>
        {{ end }}
    </div>
    {{ end }}

    {{ range .Folders }}
    {{ $folder := . }}
    <div class="endpoints-group">
        <h3 id="folder-{{ slugify $folder.Name }}">
            {{ .Name }}
            <a href="#folder-{{ slugify $folder.Name }}">
                <i class="glyphicon glyphicon-link"></i>
            </a>
        </h3>
        <div>{{ markdown $folder.Description }}</div>
        {{ range $folder.Requests }}
        {{ $req := . }}
        <div class="request">
            <h4 id="request-{{ slugify $folder.Name }}-{{ slugify $req.Name }}">
                {{ $req.Name }}
                <a href="#request-{{ slugify $folder.Name }}-{{ slugify $req.Name }}">
                    <i class="glyphicon glyphicon-link"></i>
                </a>
            </h4>
            <div>{{ markdown $req.Description }}</div>
            <div>
                <ul class="nav nav-tabs" role="tablist">
                    <li role="presentation" class="active">
                        <a
                            href="#request-{{ slugify $folder.Name }}-{{ slugify $req.Name }}-example-http"
                            data-toggle="tab"
                        >HTTP</a>
                    </li>
                    <li role="presentation">
                        <a
                            href="#request-{{ slugify $folder.Name }}-{{ slugify $req.Name }}-example-curl"
                            data-toggle="tab"
                        >Curl</a>
                    </li>
                </ul>
                <div class="tab-content">
                    <div class="tab-pane active" id="request-{{ slugify $folder.Name }}-{{ slugify $req.Name }}-example-http">
                        <pre><code class="hljs http">{{ httpSnippet $req }}</code></pre>
                    </div>
                    <div class="tab-pane" id="request-{{ slugify $folder.Name }}-{{ slugify $req.Name }}-example-curl">
                        <pre><code class="hljs curl">{{ curlSnippet $req }}</code></pre>
                    </div>
                </div>
            </div>
            <h5 class="request-url">Example: {{ $req.Method }} {{ $req.URL }}</h5>
            {{ with $req.Responses }}
            <div>
                <ul class="nav nav-tabs" role="tablist">
                    {{ range $index, $res := . }}
                    <li role="presentation"{{ if eq $index 0 }} class="active"{{ end }}>
                        <a
                            href="#request-{{ slugify $folder.Name }}-{{ slugify $req.Name }}-responses-{{ $res.ID }}"
                            data-toggle="tab"
                        >
                            {{ if eq (len $req.Responses) 1 }}
                                Response
                            {{ else}}
                                {{ $res.Name }}
                            {{ end }}
                        </a>
                    </li>
                    {{ end }}
                </ul>
                <div class="tab-content">
                    {{ range $index, $res := . }}
                    <div
                        class="tab-pane{{ if eq $index 0 }} active{{ end }}"
                        id="request-{{ slugify $folder.Name }}-{{ slugify $req.Name }}-responses-{{ $res.ID }}"
                    >
                        <table class="table">
                            <tr>
                                <th style="width: 20%;">Status</th>
                                <td>{{ $res.StatusCode }} {{ $res.Status }}</td>
                            </tr>
                            {{ range $res.Headers }}
                            <tr>
                                <th style="width: 20%;">{{ .Key }}</th>
                                <td>{{ .Value }}</td>
                            </tr>
                            {{ end }}
                            {{ if hasContent $res.Body }}
                                {{ with $example := indentJSON $res.Body }}
                                <tr>
                                    <td class="response-text-sample" colspan="2">
                                        <pre><code>{{ $example }}</code></pre>
                                    </td>
                                </tr>
                                {{ end }}
                            {{ end }}
                        </table>
                    </div>
                    {{ end }}
                </div>
            </div>
            {{ end }}
        </div>
        {{ end }}
    </div>
    {{ end }}
</div>
