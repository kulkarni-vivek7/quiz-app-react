export const formatSubjectName = (subject: string) => {
    switch (subject) {
        case 'APTITUDE': return 'Aptitude';
        case 'JAVA': return 'Java';
        case 'ADVANCEJAVA': return 'Advance Java';
        case 'PYTHON': return 'Python';
        case 'DBMS': return 'DBMS';
        case 'DSA': return 'DSA';
        case 'COMPUTERS': return 'Computers';
        case 'NETWORKING': return 'Networking';
        case 'WEBDEVELOPMENT': return 'Web Development';
        case 'REACTJS': return 'ReactJS';
        case 'TYPESCRIPT': return 'TypeScript';
        case 'NEXTJS': return 'NextJS';
        default: return subject;
    }
};