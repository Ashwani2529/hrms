const ReportTemplate = ({ signatureUrl }) => {
    const styles = {
        page: {
            marginLeft: '5rem',
            marginRight: '5rem',
            'page-break-after': 'always'
        },

        columnLayout: {
            display: 'flex',
            justifyContent: 'space-between',
            margin: '3rem 0 5rem 0',
            gap: '2rem'
        },

        column: {
            display: 'flex',
            flexDirection: 'column'
        },

        spacer2: {
            height: '2rem'
        },

        fullWidth: {
            width: '100%'
        },

        marginb0: {
            marginBottom: 0
        },

        signature: {
            width: '100px',
            height: '60px'
            // transform: 'scale(0.33)'
        }
    };
    return (
        <>
            <div style={styles.page}>
                <div>
                    <h1 style={styles.introText}>Report Heading That Spans More Than Just One Line</h1>
                    <p>
                        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Rerum laborum ad quo est reprehenderit quod repellendus
                        perferendis vel aperiam quia minima earum laboriosam illo ipsum, dignissimos facilis atque saepe. Libero.
                    </p>
                </div>

                <div style={styles.spacer2} />

                <img alt="" style={styles.signature} src={signatureUrl} />
            </div>

            <div style={styles.page}>
                <p>
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Rem sunt delectus dicta quae nihil ipsum deleniti excepturi
                    sed quis dignissimos explicabo ab vel quo corporis, iusto cumque fugit id ipsam facilis dolorem ea error ipsa. Error,
                    consequuntur corrupti iste recusandae molestias saepe exercitationem iure tempora odio provident! Atque cum, odio
                    architecto adipisci eligendi, rem iste esse quia magni quibusdam voluptatibus porro, nobis minus? Sapiente, quam minima!
                    Ea similique inventore enim eum minus tenetur officia nemo voluptatem. Deserunt aperiam, in dolor necessitatibus unde
                    officiis perspiciatis illum tenetur consectetur est sit ut accusantium cumque! Laborum recusandae ex et reiciendis, nam
                    quis facere?
                </p>
                <p>
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Rem sunt delectus dicta quae nihil ipsum deleniti excepturi
                    sed quis dignissimos explicabo ab vel quo corporis, iusto cumque fugit id ipsam facilis dolorem ea error ipsa. Error,
                    consequuntur corrupti iste recusandae molestias saepe exercitationem iure tempora odio provident! Atque cum, odio
                    architecto adipisci eligendi, rem iste esse quia magni quibusdam voluptatibus porro, nobis minus? Sapiente, quam minima!
                    Ea similique inventore enim eum minus tenetur officia nemo voluptatem. Deserunt aperiam, in dolor necessitatibus unde
                    officiis perspiciatis illum tenetur consectetur est sit ut accusantium cumque! Laborum recusandae ex et reiciendis, nam
                    quis facere?
                </p>
                <p>
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Rem sunt delectus dicta quae nihil ipsum deleniti excepturi
                    sed quis dignissimos explicabo ab vel quo corporis, iusto cumque fugit id ipsam facilis dolorem ea error ipsa. Error,
                    consequuntur corrupti iste recusandae molestias saepe exercitationem iure tempora odio provident! Atque cum, odio
                    architecto adipisci eligendi, rem iste esse quia magni quibusdam voluptatibus porro, nobis minus? Sapiente, quam minima!
                    Ea similique inventore enim eum minus tenetur officia nemo voluptatem. Deserunt aperiam, in dolor necessitatibus unde
                    officiis perspiciatis illum tenetur consectetur est sit ut accusantium cumque! Laborum recusandae ex et reiciendis, nam
                    quis facere?
                </p>
                <p>
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Rem sunt delectus dicta quae nihil ipsum deleniti excepturi
                    sed quis dignissimos explicabo ab vel quo corporis, iusto cumque fugit id ipsam facilis dolorem ea error ipsa. Error,
                    consequuntur corrupti iste recusandae molestias saepe exercitationem iure tempora odio provident! Atque cum, odio
                    architecto adipisci eligendi, rem iste esse quia magni quibusdam voluptatibus porro, nobis minus? Sapiente, quam minima!
                    Ea similique inventore enim eum minus tenetur officia nemo voluptatem. Deserunt aperiam, in dolor necessitatibus unde
                    officiis perspiciatis illum tenetur consectetur est sit ut accusantium cumque! Laborum recusandae ex et reiciendis, nam
                    quis facere?
                </p>
                <p>
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Rem sunt delectus dicta quae nihil ipsum deleniti excepturi
                    sed quis dignissimos explicabo ab vel quo corporis, iusto cumque fugit id ipsam facilis dolorem ea error ipsa. Error,
                    consequuntur corrupti iste recusandae molestias saepe exercitationem iure tempora odio provident! Atque cum, odio
                    architecto adipisci eligendi, rem iste esse quia magni quibusdam voluptatibus porro, nobis minus? Sapiente, quam minima!
                    Ea similique inventore enim eum minus tenetur officia nemo voluptatem. Deserunt aperiam, in dolor necessitatibus unde
                    officiis perspiciatis illum tenetur consectetur est sit ut accusantium cumque! Laborum recusandae ex et reiciendis, nam
                    quis facere?
                </p>
                <p>
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Rem sunt delectus dicta quae nihil ipsum deleniti excepturi
                    sed quis dignissimos explicabo ab vel quo corporis, iusto cumque fugit id ipsam facilis dolorem ea error ipsa. Error,
                    consequuntur corrupti iste recusandae molestias saepe exercitationem iure tempora odio provident! Atque cum, odio
                    architecto adipisci eligendi, rem iste esse quia magni quibusdam voluptatibus porro, nobis minus? Sapiente, quam minima!
                    Ea similique inventore enim eum minus tenetur officia nemo voluptatem. Deserunt aperiam, in dolor necessitatibus unde
                    officiis perspiciatis illum tenetur consectetur est sit ut accusantium cumque! Laborum recusandae ex et reiciendis, nam
                    quis facere?
                </p>
                <p>
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Rem sunt delectus dicta quae nihil ipsum deleniti excepturi
                    sed quis dignissimos explicabo ab vel quo corporis, iusto cumque fugit id ipsam facilis dolorem ea error ipsa. Error,
                    consequuntur corrupti iste recusandae molestias saepe exercitationem iure tempora odio provident! Atque cum, odio
                    architecto adipisci eligendi, rem iste esse quia magni quibusdam voluptatibus porro, nobis minus? Sapiente, quam minima!
                    Ea similique inventore enim eum minus tenetur officia nemo voluptatem. Deserunt aperiam, in dolor necessitatibus unde
                    officiis perspiciatis illum tenetur consectetur est sit ut accusantium cumque! Laborum recusandae ex et reiciendis, nam
                    quis facere?
                </p>
                <img alt="" style={styles.signature} src={signatureUrl} />
            </div>
        </>
    );
};

export default ReportTemplate;
