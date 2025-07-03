This is an internal tool for Beeminder support workerbees but intentionally
public here on GitHub. 
It just won't do anything if you're not a Beeminder admin.

## Backstory

We can query information about our users with URLs like
<code>https://www.beeminder.com/raplet?users[]=alice@foo.com</code>
which return JSON like so:

```
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
```
  
(It only returns real user info if you're logged in as an admin, but it's the same format as above either way.)

Our goal was to have this app monitor the clipboard (copy/paste) buffer of the operating system and whenever it contains an email address, make the above API call and display information about the Beeminder user.

That way, when we're doing Beeminder support we can keep this app running in another tab or on another screen and by doing control-c on any address, we immediately see in that other window all the things Beeminder can tell us about that user.
Unfortunately we haven't figured out how to make this app run in the background so you have to at least alt-tab to it before it will notice the clipboard contents and do its lookup.
Not too much better than explicitly pasting in the email addresses but does remove a bit of the friction.

PS: We might've needed the Electron version for that, not the normal web version, which doesn't have permission to read your copy/paste buffer.

## Testing the Electron version

```
npm run-script startDesktop
```

# Changelog

<pre>
2025-07-03: Move from Glitch to Render for hosting
2019-04-02: Electron version thanks to Chris Leong!
2018-07-02: Fuss with the instructions and stuff
2018      : Gradually make it usable
2018-03-16: Merge Dreev's and Bee's initial apps
</pre>
