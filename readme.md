## Architechure

Used MVC architecture because :

- code more organized and easier to maintain
- add new features without affecting the existing code.
- By separating the different parts we can easily optimize the performance

### Hashing and Encoding

- Used SHA256 for generating hash of the url
- Then used base 64 encoding to convert the hash into a shorter, fixed-length string
- Used time stamp as unique identifier just before base64 encoding to avoid collision

## Check Documentation

[Documentation](https://task-production-8ff6.up.railway.app/api-docs/)
Screenshot:
![screencapture-task-production-8ff6-up-railway-app-api-docs-2023-01-07-22_01_21](https://user-images.githubusercontent.com/64855593/211160922-e195e872-40d6-47ec-9888-3a901f64ac1a.png)
