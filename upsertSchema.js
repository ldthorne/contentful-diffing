const contentful = require('contentful-management');
const client = contentful.createClient({
  accessToken: process.env.MANAGEMENT_TOKEN
});

module.exports = (updatedContentTypes, newContentTypes) => {
  const promises = [];
  if (updatedContentTypes.length) {
    promises.push(updateContentTypes(updatedContentTypes));
  }
  if (newContentTypes.length) {
    promises.push(createContentTypes(newContentTypes));
  }
  const flattenedPromises = [].concat.apply([], promises);
  return Promise.all(flattenedPromises)
}

const createContentTypes = (newContentTypes) => {
  return client.getSpace(process.env.TARGET_SPACE_ID)
  .then( (space) => {
    console.log('Creating new Content Types...');
    console.log(newContentTypes);
    return newContentTypes.map( (contentType) => {
      return space.createContentTypeWithId(contentType.sys.id, contentType)
      .then( (createdContentType) => {
        return createdContentType.publish();
      })
      .catch( (err) => {
        console.error('Issue creating content type!');
        console.log(contentType);
        console.error(err);
        throw new Error(err);
      });
    });
  })
  .catch( (err) => {
    console.log('Something went wrong...');
    console.error(err);
    throw new Error(err)
  });
}

const updateContentTypes = (updatedContentTypes) => {
  return client.getSpace(process.env.TARGET_SPACE_ID)
  .then( (space) => {
    console.log('Updating Content Types...');
    console.log(updatedContentTypes)
    return updatedContentTypes.map( (contentType) => {
      return space.getContentType(contentType.sys.id)
      .then( (foundContentType) => {
        // merge found content type and exist content type and save
        delete contentType.sys
        foundContentType = Object.assign(foundContentType, contentType);
        return foundContentType.update();
      })
      .then( (updatedContentType) => {
        return updatedContentType.publish();
      })
      .catch( (err) => {
        console.error('Issue updating content type');
        console.log(contentType)
        console.error(err);
        throw new Error(err);
      });
    });
  })
  .catch( (err) => {
    console.error('Something bad happened');
    console.error(err);
  })
}