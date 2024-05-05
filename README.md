# gamewebapp
Proof of concept for federated training of AI for video games


# running
```bash
uvicorn main:app --reload
```

# running with watcher
```bash
uvicorn main:app --reload --reload-include="*.html" --reload-include="*.css" --reload-include="*.js"
browser-sync 'http://localhost:8000' 'frontend' --watch --files
```