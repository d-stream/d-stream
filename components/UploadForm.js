import { Form, Input, Button } from 'semantic-ui-react';
export default () => {
    return (<Form>
        <Form.Field required>
            <label>IPFS HASH</label>
            <Input placeholder='Qm.....' />
        </Form.Field>
        <Form.Field required>
            <label>TITLE</label>
            <Input placeholder='GOT Episode 1' />
        </Form.Field>
        <Form.Field required>
            <label>CATEGORY</label>
            <Input placeholder='Sports' />
        </Form.Field>
        <Form.Field>
            <label>DESCRIPTION</label>
            <Input placeholder='This is a description..' />
        </Form.Field>
        <Button positive>Upload</Button>
        <Button negative style={{ marginLeft: '20px' }}>Discard</Button>
    </Form >);

}