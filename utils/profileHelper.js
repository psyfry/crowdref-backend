
const getAvatarColor = () => {
    const colors = [ 'red', 'blue', 'green', 'purple', 'yellow', 'orange', 'pink' ]
    function getRandomInt(max) {
        max = Math.floor(max);
        return Math.floor(Math.random() * (max)) //The maximum is inclusive and the minimum is inclusive
    }
    //Math.floor(Math.random() * (Math.floor(colors.length) - Math.ceil(0) + 1) + Math.ceil(0))
    const randomNum = getRandomInt(colors.length)
    return colors[ randomNum ]
}

const getDisplayName = (first, last) => {
    const avatarInitials = first[ 0 ] + last[ 0 ]
    console.log({ avatarInitials });
    return avatarInitials.toUpperCase()
}
const formatName = (name) => {
    const capitalizedFirst = name[ 0 ].toUpperCase()
    const remainder = name.slice(1)
    return capitalizedFirst.concat(remainder)

}
module.exports = {
    getAvatarColor,
    getDisplayName,
    formatName
}