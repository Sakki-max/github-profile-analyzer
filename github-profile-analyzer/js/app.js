const $ = (id) => document.getElementById(id);
$("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  let u = $("username").value.trim();
  if (!u) return;
  $("msg").textContent = "Loading...";
  $("app").classList.add("hidden");
  try {
    let [a, b] = await Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(u)}`),
      fetch(
        `https://api.github.com/users/${encodeURIComponent(u)}/repos?per_page=100&sort=stars`,
      ),
    ]);
    if (!a.ok)
      throw Error(
        a.status === 404 ? "User not found." : "GitHub API request failed.",
      );
    let user = await a.json(),
      repos = b.ok ? await b.json() : [];
    render(user, repos);
    $("msg").textContent = "";
    $("app").classList.remove("hidden");
  } catch (x) {
    $("msg").textContent = x.message;
  }
});
function render(u, rs) {
  $("avatar").src = u.avatar_url;
  $("name").textContent = u.name || u.login;
  $("login").textContent = "@" + u.login;
  $("bio").textContent = u.bio || "No bio available.";
  $("link").href = u.html_url;
  $("repos").textContent = u.public_repos;
  $("followers").textContent = u.followers;
  $("following").textContent = u.following;
  $("location").textContent = u.location || "Not specified";
  $("company").textContent = u.company || "Not specified";
  $("joined").textContent = new Date(u.created_at).toLocaleDateString();
  $("stars").textContent = rs.reduce((x, r) => x + r.stargazers_count, 0);
  let langs = {};
  rs.forEach((r) => {
    if (r.language) langs[r.language] = (langs[r.language] || 0) + 1;
  });
  let ls = Object.entries(langs)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8),
    total = ls.reduce((x, [, n]) => x + n, 0) || 1;
  $("languages").innerHTML =
    ls
      .map(
        ([n, c]) =>
          `<div class="lang"><div>${safe(n)} <small>${Math.round((c / total) * 100)}%</small></div><div class="bar"><span style="width:${(c / total) * 100}%"></span></div></div>`,
      )
      .join("") || "No language data.";
  $("repoList").innerHTML =
    rs
      .slice(0, 12)
      .map(
        (r) =>
          `<div class="repo"><h4><a href="${r.html_url}" target="_blank">${safe(r.name)}</a></h4><p>${safe(r.description || "No description")}</p><span class="tag">★ ${r.stargazers_count}</span><span class="tag">Forks ${r.forks_count}</span>${r.language ? `<span class="tag">${safe(r.language)}</span>` : ""}</div>`,
      )
      .join("") || "No public repositories.";
}
function safe(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[c],
  );
}
