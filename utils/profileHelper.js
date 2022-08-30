
const getAvatarColor = () => {
    const colors = [ 'red', 'blue', 'green', 'purple', 'indigo', '#583c87', 'orange', 'lime', 'teal', '#0097a7', '#df487f', '#33a095', '#005f56' ]
    //Return avatar color at random index
    return colors[ Math.floor(Math.random() * colors.length) ]
}

const getDisplayName = (first, last) => {
    const avatarInitials = first[ 0 ] + last[ 0 ]
    console.log({ avatarInitials })
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