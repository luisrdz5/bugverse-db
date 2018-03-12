# BUGVerse-db

## Usage 

``` js
const setupDatabase =require('bugverse-db')

setupDatabase(config).then( db => {
    const { Agent, Metric} = db

}).catch(err => console.error(err))
```
###Modules Aggregate
-chalk : its a module like make beautiful the server response 
