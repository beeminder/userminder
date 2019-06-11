<h1>Backstory (no need to read this)</h1>

<p>
We can query information about our users with URLs like
<code>https://www.beeminder.com/raplet?users[]=alice@foo.com</code>
which return JSON like so:

<pre>
[
  {
    username: "not_a_real_user",
    goals: [ "not_a_real_goal", "example", "foo", "bar" ],
    email: "support@beeminder.com",
    subscription: null,
    is_payer: false,
    pledged: 0,
    since: "2011/10",
    email_given: "alice@foo.com"
  }
]
</pre>
  
(It only returns real user info if you're logged in as an admin, but it's the same format as above either way.)
</p>

<p>
Our goal was to have this app monitor the clipboard (copy/paste) buffer of the operating system and whenever it contains an email address, make the above API call and display information about the Beeminder user.
</p>

<p>
That way, when we're doing Beeminder support we can keep this app running in another tab or on another screen and by doing control-c on any address, we'll immediately see in that other window all the things Beeminder can tell us about that user.
Unfortunately we haven't figured out how to make this app run in the background so you have to at least alt-tab to it before it will notice the clipboard contents and do its lookup.
Not too much better than explicitly pasting in the email addresses but does remove a bit of the friction.
</p>

## Testing the Electron version

```
npm run-script startDesktop
```

## Packaging the Electron version

Run `./setup.sh` to install dependencies. This requires Homebrew to have already been installed. Then you can run `./build.sh` to build and `upload.sh` to upload.

The version is stored in a file called "version". You need to edit the version number each time you want to upload otherwise you'll see an error: Duplicate value for "tag_name"

# Changelog

<pre>
2019-04-02: Electron version thanks to Chris Leong!
2018-07-02: Fuss with the instructions and stuff
2018      : Gradually make it usable
2018-03-16: Merge Dreev's and Bee's initial apps
</pre>
