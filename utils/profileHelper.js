
const getAvatarColor = () => {
    const colors = [ 'red', 'blue', 'green', 'purple', 'yellow', 'indigo', 'orange', 'lime', 'teal', 'cyan' ]
    //Return avatar color at random index 
    return colors[ Math.floor(Math.random() * colors.length) ]
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