<div class="logo">
    <a href="../"><img src="/img/logos/white.svg" /></a>
</div>
<div class="version">Robert2 API, v<span id="version-number"></span></div>
<div class="scrollspy">
    <ul id="main-menu" class="nav">
        <li>
            <a href="#doc-general-notes">General notes</a>
        </li>
        {{ with $structures := .Structures }}
        <li>
            <a href="#doc-api-structures">API structures</a>
            <ul>
                {{ range $structures }}
                <li>
                    <a href="#struct-{{ .Name }}">{{ .Name }}</a>
                </li>
                {{ end }}
            </ul>
        </li>
        {{ end }}
        <li>
            <a href="#doc-api-detail">API detail</a>
        </li>
        {{ range .Requests }}
        <li>
            <a href="#request-{{ slugify .Name }}">{{ .Name }}</a>
        </li>
        {{ end }}
        {{ range .Folders }}
        {{ $folder := . }}
        <li>
            <a href="#folder-{{ slugify $folder.Name }}">{{ $folder.Name }}</a>
            <ul>
                {{ range $folder.Requests }}
                <li>
                    <a href="#request-{{ slugify $folder.Name }}-{{ slugify .Name }}">{{ .Name }}</a>
                </li>
                {{ end }}
            </ul>
        </li>
        {{ end }}
    </ul>
</div>
<div class="licence">
    Powered by <a href="https://github.com/aubm/postmanerator">Postmanerator</a> (MIT licence)
</div>
