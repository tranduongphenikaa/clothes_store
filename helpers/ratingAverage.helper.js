module.exports.ratingAvg = async (reviews) => {
    if(reviews.length == 0){
        return 0;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0); 
    const averageRating = totalRating / reviews.length; 

    return Math.round(averageRating);
}